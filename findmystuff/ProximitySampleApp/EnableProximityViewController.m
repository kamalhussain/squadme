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
#import "EnableProximityViewController.h"
#import "ApplicationContext.h"
#import <QuartzCore/QuartzCore.h>
#import "AppDelegate.h"

@interface EnableProximityViewController ()

- (void)initializeFyxService;

@end

@implementation EnableProximityViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    [self setupNavigationBar];
    

    self.view.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"background.png"]];
    [self initializeProximityServiceSwitchView];
    [self initializeLogoToMove];
    [self performSelector:@selector(showProximityServicesSwitchViewAndNavigationBar) withObject:nil afterDelay:1.0];
    [self performSelector:@selector(initializeFyxService) withObject:nil afterDelay:2.0];


}

- (void) showProximityServicesSwitchViewAndNavigationBar
{
    [self.proximityServiceSwitchView setHidden:false];
    [self.navigationBar setHidden:false];
}

- (void) initializeFyxService {
    [[ApplicationContext sharedInstance] initializeFyxService];
}

- (void) initializeProximityServiceSwitchView {
    UIView *v = self.switchView;
    [v.layer setCornerRadius:10.0f];
    [v.layer setBorderColor:[UIColor lightGrayColor].CGColor];
    [v.layer setBorderWidth:0.5f];
    [v.layer setShadowColor:[UIColor blackColor].CGColor];
    [v.layer setShadowOpacity:0.0];
    [v.layer setShadowRadius:0.0];
    [v.layer setShadowOffset:CGSizeMake(0.0, 0.0)];
}

- (void) initializeLogoToMove
{
    [self moveImage:self.logoView duration:0.9 curve:UIViewAnimationCurveLinear x:0.0 y:-95.0];
}

- (void)moveImage:(UIView *)view duration:(NSTimeInterval)duration
            curve:(int)curve x:(CGFloat)x y:(CGFloat)y
{
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:duration];
    [UIView setAnimationCurve:curve];
    [UIView setAnimationBeginsFromCurrentState:YES];
    
    CGAffineTransform transform = CGAffineTransformMakeTranslation(x, y);
    view.transform = transform;
        [UIView commitAnimations];
}

- (void)viewDidUnload
{
    [self setProximityServiceSwitch:nil];
    [self setNavigationBar:nil];
    [self setProximityServiceSwitchView:nil];
    [self setLogoView:nil];
    [self setSwitchView:nil];
    [super viewDidUnload];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone) {
        return (interfaceOrientation != UIInterfaceOrientationPortraitUpsideDown);
    } else {
        return YES;
    }
}

- (IBAction)proximityServiceSwitchChanged:(id)sender {
    if (_proximityServiceSwitch.on == TRUE) {
        _proximityServiceSwitch.on = FALSE;
        AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        if (appDelegate && [appDelegate respondsToSelector:@selector(didEnableProximity)]) {
            [appDelegate didEnableProximity];
        }
    }
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)setupNavigationBar
{
    [self.navigationBar setBackgroundImage:[UIImage imageNamed:@"nav_bar_tile.png"] forBarMetrics:UIBarMetricsDefault];
    NSDictionary *navbarTitleTextAttribs = [NSDictionary dictionaryWithObjectsAndKeys:                                               [UIColor whiteColor],UITextAttributeTextColor, nil];
    [self.navigationBar setTitleTextAttributes: navbarTitleTextAttribs];
}


@end
