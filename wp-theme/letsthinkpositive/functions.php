<?php
/**
 * Theme functions and asset enqueueing
 */

if (!function_exists('letsthink_theme_setup')) {
    function letsthink_theme_setup()
    {
        add_theme_support('title-tag');
    }
}
add_action('after_setup_theme', 'letsthink_theme_setup');

function letsthink_enqueue_assets()
{
    // Google fonts
    wp_enqueue_style('letsthink-fonts', 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap', array(), null);

    // Main theme stylesheet (full)
    wp_enqueue_style('letsthink-style', get_stylesheet_directory_uri() . '/assets/css/style-full.css', array(), time());

    // Main JS
    wp_enqueue_script('letsthink-main', get_stylesheet_directory_uri() . '/assets/js/main.js', array(), time(), true);
}
add_action('wp_enqueue_scripts', 'letsthink_enqueue_assets');

/**
 * Create subscribers table on theme activation
 */
function letsthink_create_tables()
{
    global $wpdb;
    $table_name = $wpdb->prefix . 'ltp_subscribers';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            email VARCHAR(191) NOT NULL,
            source VARCHAR(191) DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY email (email)
        ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
// Theme activation hook: create tables when theme is activated
add_action('after_switch_theme', 'letsthink_create_tables');

/**
 * REST endpoint to record subscriber
 */
function letsthink_register_rest_routes()
{
    register_rest_route('letsthink/v1', '/subscribe', array(
        'methods' => 'POST',
        'callback' => 'letsthink_handle_subscribe',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'letsthink_register_rest_routes');

function letsthink_handle_subscribe($request)
{
    global $wpdb;
    $params = $request->get_json_params();
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';
    $source = isset($params['source']) ? sanitize_text_field($params['source']) : '';

    if (!is_email($email)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Invalid email'), 400);
    }

    $table = $wpdb->prefix . 'ltp_subscribers';

    $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE email = %s", $email));
    if ($exists) {
        return new WP_REST_Response(array('success' => true, 'message' => 'Already subscribed'), 200);
    }

    $inserted = $wpdb->insert($table, array('email' => $email, 'source' => $source), array('%s', '%s'));
    if ($inserted) {
        return new WP_REST_Response(array('success' => true, 'message' => 'Subscribed'), 201);
    }

    return new WP_REST_Response(array('success' => false, 'message' => 'Database error'), 500);
}

/**
 * Admin page to list subscribers
 */
function letsthink_add_admin_menu()
{
    add_menu_page('Subscribers', 'Subscribers', 'manage_options', 'letsthink-subscribers', 'letsthink_render_subscribers_page', 'dashicons-email', 58);
}
add_action('admin_menu', 'letsthink_add_admin_menu');

function letsthink_render_subscribers_page()
{
    if (!current_user_can('manage_options'))
        return;
    global $wpdb;
    $table = $wpdb->prefix . 'ltp_subscribers';
    $rows = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 1000");
?>
        <div class="wrap">
            <h1>Subscribers</h1>
            <table class="widefat fixed" cellspacing="0">
                <thead><tr><th>ID</th><th>Email</th><th>Source</th><th>Subscribed</th></tr></thead>
                <tbody>
                <?php if ($rows):
        foreach ($rows as $r): ?>
                    <tr>
                        <td><?php echo esc_html($r->id); ?></td>
                        <td><?php echo esc_html($r->email); ?></td>
                        <td><?php echo esc_html($r->source); ?></td>
                        <td><?php echo esc_html($r->created_at); ?></td>
                    </tr>
                <?php
        endforeach;
    else: ?>
                    <tr><td colspan="4">No subscribers yet.</td></tr>
                <?php
    endif; ?>
                </tbody>
            </table>
        </div>
        <?php
}
