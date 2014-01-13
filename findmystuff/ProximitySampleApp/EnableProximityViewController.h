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
#import <UIKit/UIKit.h>
#import "ApplicationContext.h"
#import <FYX/FYX.h>

@protocol EnableProximityDelegate <NSObject>
- (void)didEnableProximity;
@end

@interface EnableProximityViewController : UIViewController

@property (weak, nonatomic) id<EnableProximityDelegate> delegate;
@property (weak, nonatomic) IBOutlet UINavigationBar *navigationBar;
@property (strong, nonatomic) IBOutlet UISwitch *proximityServiceSwitch;
@property (strong, nonatomic) IBOutlet UIView *proximityServiceSwitchView;
@property (strong, nonatomic) IBOutlet UIView *logoView;
@property (strong, nonatomic) IBOutlet UIView *switchView;

- (IBAction)proximityServiceSwitchChanged:(id)sender;

@end
