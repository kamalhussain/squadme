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
#import "UserSettingsRepository.h"

@implementation UserSettingsRepository

-(void)setFYXServiceStarted:(BOOL)fyxServiceStarted {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString* fyxServiceStartedAsString = fyxServiceStarted ? @"YES" : @"NO";
    [defaults setObject:fyxServiceStartedAsString forKey:@"fyx_service_started_key"];
    [defaults synchronize];
}

-(BOOL)getFYXServiceStarted {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString* fyxServiceStartedAsString = [defaults objectForKey:@"fyx_service_started_key"];
    return [fyxServiceStartedAsString isEqualToString:@"YES"];
}

-(void)setRegistrationSkipped:(BOOL)registrationSkipped {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString* registrationSkippedAsString = registrationSkipped ? @"YES" : @"NO";
    [defaults setObject:registrationSkippedAsString forKey:@"registration_skipped_key"];
    [defaults synchronize];
}

-(BOOL)getRegistrationSkipped {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString* registrationSkippedAsString = [defaults objectForKey:@"registration_skipped_key"];
    return [registrationSkippedAsString isEqualToString:@"YES"];
}

+(void)setAvatarID:(NSInteger)avatarID forTransmitterID:(NSString *)transmitterID {

    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSDictionary *existingAvatarIDs = [defaults objectForKey:@"transmitter_avatar_ids"];
    NSMutableDictionary *updatedAvatarIDs = nil;
    
    if (existingAvatarIDs) {
        updatedAvatarIDs = [existingAvatarIDs mutableCopy];
    } else {
        updatedAvatarIDs = [NSMutableDictionary new];
    }
    [updatedAvatarIDs setValue:[NSNumber numberWithInt:avatarID] forKey:transmitterID];
    [defaults setObject:updatedAvatarIDs forKey:@"transmitter_avatar_ids"];
    [defaults synchronize];
}

+ (NSInteger)getAvatarIDForTransmitterID:(NSString *)transmitterID {
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSDictionary *existingAvatarIDs = [defaults objectForKey:@"transmitter_avatar_ids"];
    if (existingAvatarIDs) {
        NSNumber *avatarID = [existingAvatarIDs valueForKey:transmitterID];
        if (avatarID) {
            // Return the actual avatar ID if we found it
            return [avatarID integerValue];
        }
    }
    // Return the default avatar ID
    return 1;
}

@end
