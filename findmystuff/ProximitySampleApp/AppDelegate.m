/**
 * Copyright (C) 2013 Qualcomm Retail Solutions, Inc. All rights reserved.
 *
 * This software is the confidential and proprietary information of Qualcomm
 * Retail Solutions, Inc.
 *
 * The following sample code illustrates various aspects of the FYX iOS SDK.
 *
 * The sample code herein is provided for your convenience, and has not been
 * tested or designed to work on any particular system configuration. It is
 * provided pursuant to the License Agreement for FYX Software and Developer
 * Portal AS IS, and your use of this sample code, whether as provided or with
 * any modification, is at your own risk. Neither Qualcomm Retail Solutions,
 * Inc. nor any affiliate takes any liability nor responsibility with respect
 * to the sample code, and disclaims all warranties, express and implied,
 * including without limitation warranties on merchantability, fitness for a
 * specified purpose, and against infringement.
 */
#import "AppDelegate.h"
#import "ApplicationContext.h"
#import "EnableProximityViewController.h"

@interface AppDelegate()

- (void)showSightingsTable;
- (void)registerInitialValuesForUserDefaults;
@end


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    [self registerInitialValuesForUserDefaults];
    [[ApplicationContext sharedInstance] initializeFyxService];

    if ([[ApplicationContext sharedInstance].userSettingRepository getFYXServiceStarted] == NO) {
        // Set up the delegate so we get called when proximity is enabled
        EnableProximityViewController *enableProximityVC = (EnableProximityViewController *)self.window.rootViewController;
        enableProximityVC.delegate = self;
    }
    else {
        [FYX startService:self];
        // Go straight to the sightings table
        EnableProximityViewController *enableProximityVC = (EnableProximityViewController *)self.window.rootViewController;
        enableProximityVC.delegate = self;
    }
    return YES;
}

- (void)showSightingsTable {

    UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"MainStoryboard_iPhone" bundle:nil];
    UINavigationController *controller = [storyboard instantiateViewControllerWithIdentifier:@"sightingsNavigationController"];
    self.window.rootViewController = controller;
    
    [self.window makeKeyAndVisible];
}

// Register the UserDefaults initial values to those provided in the settings bundle
// You'd think this would be automatic but it's not, so this method needs to be called!
// NOTE: Any initial values registered via this method will always be overridden by user-modified settings
- (void)registerInitialValuesForUserDefaults {
    
    // Get the path of the settings bundle (Settings.bundle)
    NSString *settingsBundlePath = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"bundle"];
    if (!settingsBundlePath) {
        NSLog(@"ERROR: Unable to locate Settings.bundle within the application bundle!");
        return;
    }
    
    // Get the path of the settings plist (Root.plist) within the settings bundle
    NSString *settingsPlistPath = [[NSBundle bundleWithPath:settingsBundlePath] pathForResource:@"Root" ofType:@"plist"];
    if (!settingsPlistPath) {
        NSLog(@"ERROR: Unable to locate Root.plist within Settings.bundle!");
        return;
    }
    
    // Create a new dictionary to hold the default values to register
    NSMutableDictionary *defaultValuesToRegister = [NSMutableDictionary new];
    
    // Iterate over the preferences found in the settings plist
    NSArray *preferenceSpecifiers = [[NSDictionary dictionaryWithContentsOfFile:settingsPlistPath] objectForKey:@"PreferenceSpecifiers"];
    for (NSDictionary *preference in preferenceSpecifiers) {
        
        NSString *key = [preference objectForKey:@"Key"];
        id defaultValueObject = [preference objectForKey:@"DefaultValue"];
        
        if (key && defaultValueObject) {
            // If a default value was found, add it to the dictionary
            [defaultValuesToRegister setObject:defaultValueObject forKey:key];
        }
    }

    // Register the initial values in UserDefaults that were found in the settings bundle
    if (defaultValuesToRegister.count > 0) {
        NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
        [userDefaults registerDefaults:defaultValuesToRegister];
        [userDefaults synchronize];
    }
}

- (void)didEnableProximity {
    [FYX startService:self];
}

#pragma mark - FYXServiceDelegate methods

- (void)serviceStarted {
    NSLog(@"#########Proximity service started!");
    [[ApplicationContext sharedInstance].userSettingRepository setFYXServiceStarted:YES];
    [self showSightingsTable];
}

- (void)startServiceFailed:(NSError *)error {
    NSString *message = @"Service failed to start, please check to make sure your Application Id and Secret are correct.";
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Proximity Service"
                                                      message:message
                                                     delegate:nil
                                            cancelButtonTitle:@"OK"
                                            otherButtonTitles:nil];
    [alert show];
}

@end
