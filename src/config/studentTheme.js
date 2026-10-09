// Ant Design overrides for students on phones/tablets. Platform body text is
// 16px (iOS 17pt, Material 16sp, SLDS 16px) with 14px as the floor; antd's 14px
// default is desktop-sized. Applied by layouts/Sidebar.jsx on top of the app theme.
export const STUDENT_MOBILE_THEME = {
  token: {
    fontSize: 16,
    fontSizeSM: 14,
    fontSizeLG: 18,
    fontSizeHeading5: 18,
    fontSizeHeading4: 20,
    fontSizeHeading3: 22,
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
};
