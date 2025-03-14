import { message } from 'antd';
// import React from 'react'

function useAlert() {

  const success = (content) => {
    message.success(content)
  };

  const error = (content) => {
    message.error(content)

  };

  const warning = (content) => {
    message.warning(content)
  };


  return {
    success,
    error,
    warning
  }
}

export default useAlert