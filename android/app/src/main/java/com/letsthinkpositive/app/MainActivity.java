package com.letsthinkpositive.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable Chrome DevTools debugging (remove before Play Store release)
        WebView.setWebContentsDebuggingEnabled(true);

        WebView webView = getBridge().getWebView();
        WebSettings s = webView.getSettings();

        // ── Core ──────────────────────────────────────────────────────────
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        // ── Viewport ──────────────────────────────────────────────────────
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setTextZoom(100);          // lock to 100% — prevents system scaling breaking layout
        s.setDefaultTextEncodingName("UTF-8");

        // ── Cache strategy ────────────────────────────────────────────────
        // LOAD_NO_CACHE on every cold start ensures CSS/JS hashes are always fresh.
        // Next.js changes asset hashes on every deploy, so WebView cached URLs
        // become 404 / stale — causing the "no CSS on first load" issue.
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // Clear all WebView cache + cookies from previous app sessions
        webView.clearCache(true);
        webView.clearHistory();
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        // ── User Agent ────────────────────────────────────────────────────
        // Use a standard Chrome Mobile UA so the server returns the same full
        // HTML/CSS/JS that desktop Chrome receives (some servers serve lite pages
        // to non-Chrome UAs).
        String chromeUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) "
            + "AppleWebKit/537.36 (KHTML, like Gecko) "
            + "Chrome/124.0.0.0 Mobile Safari/537.36";
        s.setUserAgentString(chromeUA);

        // ── Media ─────────────────────────────────────────────────────────
        s.setMediaPlaybackRequiresUserGesture(false);
    }
}
