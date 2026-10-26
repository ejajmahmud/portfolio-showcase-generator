<?php
/**
 * Plugin Name: Shinjiru Portfolio Showcase Sync
 * Plugin URI: https://www.shinjiru.com.my
 * Description: Real-time synchronization bridge between Portfolio Showcase Studio and the Shinjiru Web Design Portfolio page. Includes zero-style-interference rendering and instant reversible rollbacks.
 * Version: 1.0.0
 * Author: Ejaj Mahmud / Shinjiru Technology
 * Author URI: https://www.shinjiru.com.my
 * License: Proprietary
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Shinjiru_Portfolio_Sync {

    const OPTION_ITEMS = 'shinjiru_synced_portfolio_items';
    const OPTION_TOKEN = 'shinjiru_portfolio_sync_token';
    const OPTION_LOG = 'shinjiru_portfolio_sync_log';
    const UPLOAD_SUBDIR = 'portfolio-showcases';

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Register REST API routes
        add_action('rest_api_init', array($this, 'register_rest_routes'));

        // Admin menu
        add_action('admin_menu', array($this, 'register_admin_menu'));

        // Template output buffer hook to automatically inject cards seamlessly into portfolio page
        add_action('template_redirect', array($this, 'setup_template_injection'));

        // Initialize default secret token if not set (using native PHP random_bytes)
        add_action('init', array($this, 'ensure_default_token'));
    }

    /**
     * Ensure sync token exists
     */
    public function ensure_default_token() {
        if (!get_option(self::OPTION_TOKEN)) {
            $token = 'shj_' . bin2hex(random_bytes(24));
            update_option(self::OPTION_TOKEN, $token);
        }
    }

    /**
     * Register REST API Endpoints
     */
    public function register_rest_routes() {
        register_rest_route('shinjiru-portfolio/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_sync_item'),
            'permission_callback' => array($this, 'verify_api_permission'),
        ));

        register_rest_route('shinjiru-portfolio/v1', '/rollback', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_rollback_item'),
            'permission_callback' => array($this, 'verify_api_permission'),
        ));

        register_rest_route('shinjiru-portfolio/v1', '/items', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_items'),
            'permission_callback' => array($this, 'verify_api_permission'),
        ));

        register_rest_route('shinjiru-portfolio/v1', '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_health_check'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * Verify API Authentication Token
     */
    public function verify_api_permission($request) {
        $token = get_option(self::OPTION_TOKEN);
        if (empty($token)) {
            return new WP_Error('no_token_configured', 'Sync token is not configured in WordPress settings.', array('status' => 500));
        }

        $header_token = $request->get_header('x-shinjiru-sync-token');
        if (empty($header_token)) {
            $auth_header = $request->get_header('authorization');
            if ($auth_header && preg_match('/Bearer\s+(\S+)/i', $auth_header, $matches)) {
                $header_token = $matches[1];
            }
        }

        if (empty($header_token) || !hash_equals($token, trim($header_token))) {
            return new WP_Error('invalid_token', 'Unauthorized: Invalid or missing sync token.', array('status' => 401));
        }

        return true;
    }

    /**
     * Health check endpoint
     */
    public function rest_health_check() {
        $items = get_option(self::OPTION_ITEMS, array());
        return rest_ensure_response(array(
            'status' => 'healthy',
            'service' => 'shinjiru-portfolio-sync',
            'version' => '1.0.0',
            'total_synced_items' => count($items),
            'timestamp' => current_time('mysql'),
        ));
    }

    /**
     * REST Handler: Sync / Publish an item
     */
    public function rest_sync_item($request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_params();
        }

        $title = sanitize_text_field($params['title'] ?? '');
        $url = esc_url_raw($params['url'] ?? '');
        $industry = sanitize_text_field($params['industry'] ?? 'Business & Services');
        $website_type = sanitize_text_field($params['website_type'] ?? 'Business');
        $slug = sanitize_title($params['slug'] ?? ($title ? sanitize_title($title) : ''));
        $image_base64 = $params['image_base64'] ?? '';
        $image_url_param = esc_url_raw($params['image_url'] ?? '');
        $client_ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');

        if (empty($title) || empty($url) || empty($slug)) {
            return new WP_Error('missing_required_fields', 'Title, URL, and Slug are required.', array('status' => 400));
        }

        // Upload directory for portfolio showcases
        $upload_dir = wp_upload_dir();
        $target_dir = $upload_dir['basedir'] . '/' . self::UPLOAD_SUBDIR;
        $target_url = $upload_dir['baseurl'] . '/' . self::UPLOAD_SUBDIR;

        if (!file_exists($target_dir)) {
            wp_mkdir_p($target_dir);
        }

        $image_url = '';

        // Process Base64 Image
        if (!empty($image_base64)) {
            if (preg_match('/^data:image\/(\w+);base64,/', $image_base64, $type)) {
                $image_base64 = substr($image_base64, strpos($image_base64, ',') + 1);
            }
            $image_data = base64_decode($image_base64);
            if ($image_data === false) {
                return new WP_Error('invalid_base64', 'Provided image data is not valid base64.', array('status' => 400));
            }

            $filename = $slug . '.webp';
            $file_path = $target_dir . '/' . $filename;

            // Preserve rollback backup if file existed
            if (file_exists($file_path)) {
                @copy($file_path, $target_dir . '/' . $slug . '.bak-' . time() . '.webp');
            }

            file_put_contents($file_path, $image_data);
            $image_url = $target_url . '/' . $filename;
        } elseif (!empty($image_url_param)) {
            $filename = $slug . '.webp';
            $file_path = $target_dir . '/' . $filename;
            
            $response = wp_remote_get($image_url_param, array('timeout' => 30, 'sslverify' => false));
            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                file_put_contents($file_path, wp_remote_retrieve_body($response));
                $image_url = $target_url . '/' . $filename;
            } else {
                $image_url = $image_url_param;
            }
        }

        if (empty($image_url)) {
            return new WP_Error('missing_image', 'Either image_base64 or image_url must be provided.', array('status' => 400));
        }

        // Store in options
        $items = get_option(self::OPTION_ITEMS, array());
        if (!is_array($items)) {
            $items = array();
        }

        $is_update = isset($items[$slug]);
        $existing_created_at = $is_update ? ($items[$slug]['created_at'] ?? current_time('mysql')) : current_time('mysql');

        $item_entry = array(
            'slug' => $slug,
            'title' => $title,
            'url' => $url,
            'industry' => $industry,
            'website_type' => $website_type,
            'image_url' => $image_url,
            'status' => 'published',
            'created_at' => $existing_created_at,
            'updated_at' => current_time('mysql'),
            'synced_from_ip' => $client_ip,
        );

        // Prepend new items so they appear at the very top of the showcase
        if ($is_update) {
            $items[$slug] = $item_entry;
        } else {
            $items = array($slug => $item_entry) + $items;
        }

        update_option(self::OPTION_ITEMS, $items);

        // Log action for rollback audit
        $this->log_action('SYNC_PUBLISH', $slug, $title, array('industry' => $industry, 'type' => $website_type, 'url' => $url));

        return rest_ensure_response(array(
            'success' => true,
            'message' => $is_update ? 'Portfolio showcase updated successfully.' : 'Portfolio showcase approved and synced successfully.',
            'item' => $item_entry,
            'total_synced' => count($items),
        ));
    }

    /**
     * REST Handler: Rollback / Unpublish an item
     */
    public function rest_rollback_item($request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_params();
        }

        $slug = sanitize_title($params['slug'] ?? '');
        if (empty($slug)) {
            return new WP_Error('missing_slug', 'Slug parameter is required for rollback.', array('status' => 400));
        }

        $items = get_option(self::OPTION_ITEMS, array());
        if (!isset($items[$slug])) {
            return new WP_Error('not_found', "Showcase '{$slug}' not found in synced items.", array('status' => 404));
        }

        $removed_item = $items[$slug];
        unset($items[$slug]);
        update_option(self::OPTION_ITEMS, $items);

        // Safely archive or remove the uploaded image
        $upload_dir = wp_upload_dir();
        $file_path = $upload_dir['basedir'] . '/' . self::UPLOAD_SUBDIR . '/' . $slug . '.webp';
        if (file_exists($file_path)) {
            $archive_path = $upload_dir['basedir'] . '/' . self::UPLOAD_SUBDIR . '/' . $slug . '.rolledback-' . time() . '.webp';
            @rename($file_path, $archive_path);
        }

        $this->log_action('ROLLBACK_UNPUBLISH', $slug, $removed_item['title'] ?? $slug, $removed_item);

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Showcase '{$slug}' successfully rolled back and unpublished from portfolio.",
            'slug' => $slug,
            'total_remaining' => count($items),
        ));
    }

    /**
     * REST Handler: Get all synced items
     */
    public function rest_get_items() {
        $items = get_option(self::OPTION_ITEMS, array());
        return rest_ensure_response(array(
            'success' => true,
            'total' => count($items),
            'items' => array_values($items),
        ));
    }

    /**
     * Log actions for reversible audit
     */
    private function log_action($action, $slug, $title, $data = array()) {
        $logs = get_option(self::OPTION_LOG, array());
        if (!is_array($logs)) {
            $logs = array();
        }

        $uuid = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : bin2hex(random_bytes(16));
        $entry = array(
            'id' => $uuid,
            'action' => $action,
            'slug' => $slug,
            'title' => $title,
            'timestamp' => current_time('mysql'),
            'data' => $data,
        );

        array_unshift($logs, $entry);
        $logs = array_slice($logs, 0, 100);
        update_option(self::OPTION_LOG, $logs);
    }

    /**
     * Render synced portfolio cards HTML
     * Generates exact matching Bootstrap 4 markup with zero style alterations
     */
    public static function render_synced_cards_html() {
        $items = get_option(self::OPTION_ITEMS, array());
        if (empty($items) || !is_array($items)) {
            return '';
        }

        $output = "<!-- === SHINJIRU PORTFOLIO SYNC: DYNAMIC APPROVED CARDS START === -->\n";
        foreach ($items as $item) {
            $slug = esc_attr($item['slug']);
            $title = esc_attr($item['title']);
            $url = esc_url($item['url']);
            $industry = esc_attr($item['industry']);
            $website_type = esc_attr($item['website_type']);
            $image_url = esc_url($item['image_url']);

            $output .= "<!-- Synced Item: {$title} ({$slug}) -->\n";
            $output .= "<div class=\"col-xl-3 col-md-6 mt-4 shinjiru-synced-card-col\" data-synced-slug=\"{$slug}\">\n";
            $output .= "    <div class=\"card\" data-industry=\"{$industry}\" data-website-type=\"{$website_type}\" data-title=\"{$title}\">\n";
            $output .= "        <img src=\"{$image_url}\" class=\"card-img-top clickable-img\" alt=\"{$title}\" />\n";
            $output .= "        <div class=\"card-body text-center\">\n";
            $output .= "            <p class=\"card-text mt-4\"><strong>{$title}</strong></p>\n";
            $output .= "            <a href=\"{$url}\" target=\"_blank\"><button class=\"btn btn-buynow\">View Website</button></a>\n";
            $output .= "        </div>\n";
            $output .= "    </div>\n";
            $output .= "</div>\n";
        }
        $output .= "<!-- === SHINJIRU PORTFOLIO SYNC: DYNAMIC APPROVED CARDS END === -->\n";

        return $output;
    }

    /**
     * Template Output Buffer Injection
     */
    public function setup_template_injection() {
        if (is_admin()) {
            return;
        }

        $uri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($uri, 'portfolio') !== false || is_page_template('page-web-design-portfolio.php')) {
            ob_start(array($this, 'filter_portfolio_page_output'));
        }
    }

    public function filter_portfolio_page_output($html) {
        if (strpos($html, 'SHINJIRU PORTFOLIO SYNC: DYNAMIC APPROVED CARDS') !== false) {
            return $html;
        }

        $cards_html = self::render_synced_cards_html();
        if (empty($cards_html)) {
            return $html;
        }

        $target = '<div class="row pt-4 pb-4">';
        $pos = strpos($html, $target);
        if ($pos !== false) {
            $insert_pos = $pos + strlen($target);
            $html = substr($html, 0, $insert_pos) . "\n" . $cards_html . substr($html, $insert_pos);
        }

        return $html;
    }

    /**
     * WP-Admin Menu
     */
    public function register_admin_menu() {
        add_submenu_page(
            'tools.php',
            'Portfolio Showcase Sync',
            'Portfolio Sync',
            'manage_options',
            'shinjiru-portfolio-sync',
            array($this, 'render_admin_page')
        );
    }

    /**
     * WP-Admin Page UI
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (isset($_POST['shinjiru_rollback_slug']) && check_admin_referer('shinjiru_rollback_action', 'shinjiru_rollback_nonce')) {
            $slug_to_rollback = sanitize_title($_POST['shinjiru_rollback_slug']);
            $items = get_option(self::OPTION_ITEMS, array());
            if (isset($items[$slug_to_rollback])) {
                $removed = $items[$slug_to_rollback];
                unset($items[$slug_to_rollback]);
                update_option(self::OPTION_ITEMS, $items);
                $this->log_action('MANUAL_ROLLBACK_WPADMIN', $slug_to_rollback, $removed['title'] ?? $slug_to_rollback, $removed);
                echo '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> Showcase &quot;' . esc_html($slug_to_rollback) . '&quot; rolled back and removed from portfolio.</p></div>';
            }
        }

        if (isset($_POST['shinjiru_regen_token']) && check_admin_referer('shinjiru_token_action', 'shinjiru_token_nonce')) {
            $new_token = 'shj_' . bin2hex(random_bytes(24));
            update_option(self::OPTION_TOKEN, $new_token);
            echo '<div class="notice notice-success is-dismissible"><p><strong>Success:</strong> New Sync Secret Token generated.</p></div>';
        }

        $items = get_option(self::OPTION_ITEMS, array());
        $token = get_option(self::OPTION_TOKEN);
        $logs = get_option(self::OPTION_LOG, array());
        $sync_endpoint = site_url('/wp-json/shinjiru-portfolio/v1/sync');
        ?>
        <div class="wrap">
            <h1><span class="dashicons dashicons-cloud-upload" style="font-size:32px;width:32px;height:32px;vertical-align:middle;margin-right:8px;color:#d50000;"></span> Shinjiru Portfolio Showcase Sync Bridge</h1>
            <p style="font-size:14px;color:#555;">Automated, reversible synchronization pipeline connecting <strong>Portfolio Showcase Studio</strong> with Shinjiru Web Design Portfolio.</p>

            <div style="background:#fff;border:1px solid #ccd0d4;border-left:4px solid #d50000;padding:16px 20px;margin-bottom:24px;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.04);">
                <h3 style="margin-top:0;">API Connection Credentials</h3>
                <table class="form-table" style="margin-top:0;">
                    <tr>
                        <th style="width:200px;">Sync REST Endpoint:</th>
                        <td>
                            <code style="padding:6px 10px;font-size:13px;background:#f0f0f1;border:1px solid #dcdcde;display:inline-block;border-radius:3px;"><?php echo esc_html($sync_endpoint); ?></code>
                        </td>
                    </tr>
                    <tr>
                        <th>Sync Secret Token:</th>
                        <td>
                            <input type="text" readonly value="<?php echo esc_attr($token); ?>" style="width:480px;font-family:monospace;padding:6px 10px;" id="sync_token_input" />
                            <button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText(document.getElementById('sync_token_input').value); alert('Sync token copied to clipboard!');">Copy Token</button>
                            <form method="post" style="display:inline-block;margin-left:12px;">
                                <?php wp_nonce_field('shinjiru_token_action', 'shinjiru_token_nonce'); ?>
                                <button type="submit" name="shinjiru_regen_token" class="button button-link-delete" onclick="return confirm('Regenerate sync token? You will need to update it in Portfolio Showcase Studio.');">Regenerate Token</button>
                            </form>
                        </td>
                    </tr>
                </table>
            </div>

            <h2>Approved & Synced Showcases (<?php echo count($items); ?>)</h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:70px;">Preview</th>
                        <th>Title / Project</th>
                        <th>Client URL</th>
                        <th>Industry</th>
                        <th>Type</th>
                        <th>Date Synced</th>
                        <th style="width:130px;text-align:right;">Rollback</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($items)) : ?>
                        <tr><td colspan="7" style="text-align:center;padding:24px;color:#888;">No showcases currently synced. Use Portfolio Showcase Studio to approve and upload showcases.</td></tr>
                    <?php else : ?>
                        <?php foreach ($items as $item) : ?>
                            <tr>
                                <td>
                                    <img src="<?php echo esc_url($item['image_url']); ?>" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid #ddd;" />
                                </td>
                                <td><strong><?php echo esc_html($item['title']); ?></strong><br><small style="color:#777;"><?php echo esc_html($item['slug']); ?></small></td>
                                <td><a href="<?php echo esc_url($item['url']); ?>" target="_blank"><?php echo esc_html($item['url']); ?> &#8599;</a></td>
                                <td><span class="badge" style="background:#eef2ff;color:#3730a3;padding:4px 8px;border-radius:12px;font-size:11px;"><?php echo esc_html($item['industry']); ?></span></td>
                                <td><span class="badge" style="background:#f3f4f6;color:#374151;padding:4px 8px;border-radius:12px;font-size:11px;"><?php echo esc_html($item['website_type']); ?></span></td>
                                <td><?php echo esc_html($item['created_at']); ?></td>
                                <td style="text-align:right;">
                                    <form method="post" style="display:inline-block;" onsubmit="return confirm('Are you sure you want to rollback and remove this showcase from the live portfolio?');">
                                        <?php wp_nonce_field('shinjiru_rollback_action', 'shinjiru_rollback_nonce'); ?>
                                        <input type="hidden" name="shinjiru_rollback_slug" value="<?php echo esc_attr($item['slug']); ?>" />
                                        <button type="submit" class="button button-small button-link-delete" style="color:#b32d2e;">Rollback</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <h3 style="margin-top:32px;">Recent Sync Activity & Audit Log</h3>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:180px;">Timestamp</th>
                        <th style="width:160px;">Action</th>
                        <th>Showcase</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($logs)) : ?>
                        <tr><td colspan="4" style="color:#888;">No sync activity recorded yet.</td></tr>
                    <?php else : ?>
                        <?php foreach (array_slice($logs, 0, 15) as $log) : ?>
                            <tr>
                                <td><code><?php echo esc_html($log['timestamp']); ?></code></td>
                                <td>
                                    <?php if (strpos($log['action'], 'SYNC') !== false) : ?>
                                        <span style="color:#059669;font-weight:600;">&#10003; <?php echo esc_html($log['action']); ?></span>
                                    <?php else : ?>
                                        <span style="color:#dc2626;font-weight:600;">&#8634; <?php echo esc_html($log['action']); ?></span>
                                    <?php endif; ?>
                                </td>
                                <td><strong><?php echo esc_html($log['title']); ?></strong> (<?php echo esc_html($log['slug']); ?>)</td>
                                <td><small><?php echo esc_html(wp_json_encode($log['data'])); ?></small></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
}

// Global template helper function for explicit template integration
function shinjiru_portfolio_render_cards() {
    echo Shinjiru_Portfolio_Sync::render_synced_cards_html();
}

// Initialize the plugin
Shinjiru_Portfolio_Sync::get_instance();
