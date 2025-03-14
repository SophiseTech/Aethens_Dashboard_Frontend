import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfigProvider } from 'antd'

createRoot(document.getElementById('root')).render(
  <ConfigProvider
    theme={{
      token: {
        fontFamily: "Roboto",
        colorPrimary: "#4F651E",
      },
      components: {
        Calendar: {
          fullPanelBg: "transparent",
          fullBg: "transparent",
        },
        Layout: {
          bodyBg: "white"
        },
        Table: {
          rowSelectedBg: "#ececec",
          rowSelectedHoverBg: "#d7d7d7"
        },
        Input: {
          activeShadow: "none"
        }
      }
    }}
  >
    <App />
  </ConfigProvider>
)
