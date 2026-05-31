package com.letsthinkpositive.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onResume() {
        super.onResume();

        // Ensure WebView settings are correct for loading the live site
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        // Core settings needed to load Next.js properly
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);

        // Modern UA — prevents sites serving a "lite" mobile version
        String ua = settings.getUserAgentString();
        if (!ua.contains("LetsThinkPositive")) {
            settings.setUserAgentString(ua + " LetsThinkPositive/1.0");
        }
    }
}
