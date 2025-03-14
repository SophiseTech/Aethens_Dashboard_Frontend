import { Spin } from 'antd';
import React from 'react';

const FullPageLoading = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000
  }}>
    <Spin size="large" />
  </div>
);

export default FullPageLoading;
