package com.sadhanabuddy.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {

    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {
        // This method is required by the SocialLoginPlugin to acknowledge
        // that the MainActivity has been configured for social login.
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Forward the activity result to the SocialLogin plugin
        SocialLoginPlugin plugin = (SocialLoginPlugin) getBridge().getPlugin("SocialLogin").getInstance();
        if (plugin != null) {
            plugin.handleGoogleLoginIntent(requestCode, data);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Forward the new intent to the SocialLogin plugin (used for Apple and some Google flows)
        SocialLoginPlugin plugin = (SocialLoginPlugin) getBridge().getPlugin("SocialLogin").getInstance();
        if (plugin != null) {
            plugin.handleAppleLoginIntent(intent);
            plugin.handleGoogleLoginIntent(0, intent);
        }
    }
}
