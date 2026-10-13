import { useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { Modal, Checkbox, Button, message } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BellOutlined,
  CopyOutlined,
  EllipsisOutlined,
  MobileOutlined,
  MoreOutlined,
  PlusSquareOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import usePwaInstallPrompt from '@hooks/usePwaInstallPrompt';

// iOS share glyph (square with an up arrow), not available in antd icons
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

// Where the browser keeps its Share button, so the arrow can point at it
function getShareHint(iosBrowser, isIPad) {
  if (iosBrowser === 'chrome') return { position: 'top-right', label: <>the <ShareIcon /> Share button in the address bar</> };
  if (iosBrowser === 'edge' || iosBrowser === 'firefox') return { position: 'bottom-right', label: <>the <EllipsisOutlined /> menu, then <ShareIcon /> Share</> };
  if (isIPad) return { position: 'top-right', label: <>the <ShareIcon /> Share button</> };
  return { position: 'bottom', label: <>the <ShareIcon /> Share button (or <EllipsisOutlined /> → Share)</> };
}

const ARROW_POSITION_CLASS = {
  'bottom': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-6',
  'top-right': 'top-2 right-6',
};

function ShareArrow({ position }) {
  const Icon = position === 'top-right' ? ArrowUpOutlined : ArrowDownOutlined;
  return createPortal(
    <div className={`fixed z-[1100] pointer-events-none animate-bounce text-4xl text-primary drop-shadow ${ARROW_POSITION_CLASS[position]}`}>
      <Icon />
    </div>,
    document.body
  );
}

function Step({ number, children }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
      <span className="flex-none w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
        {number}
      </span>
      <span className="flex items-center gap-1 flex-wrap">{children}</span>
    </div>
  );
}

function IOSContent({ iosBrowser, isIPad, needsSafari, onCopy }) {
  if (needsSafari) {
    return (
      <div className="space-y-3">
        <p>Open this page in <strong>Safari</strong> to add the app to your Home Screen.</p>
        <Button icon={<CopyOutlined />} onClick={onCopy} block>Copy link</Button>
      </div>
    );
  }

  const hint = getShareHint(iosBrowser, isIPad);
  return (
    <div className="space-y-2">
      <ShareArrow position={hint.position} />
      <Step number={1}>Tap {hint.label}</Step>
      <Step number={2}>Choose <PlusSquareOutlined /> <strong>Add to Home Screen</strong></Step>
      <Step number={3}>Tap <strong>Add</strong></Step>
    </div>
  );
}

function AndroidManualContent() {
  return (
    <div className="space-y-2">
      <Step number={1}>Tap the <MoreOutlined /> browser menu</Step>
      <Step number={2}>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></Step>
    </div>
  );
}

function InAppContent({ onCopy }) {
  return (
    <div className="space-y-3">
      <p>
        This page is open inside another app. Open it in <strong>Chrome</strong> or <strong>Safari</strong> to install.
      </p>
      <Button icon={<CopyOutlined />} onClick={onCopy} block>Copy link</Button>
    </div>
  );
}

ShareArrow.propTypes = {
  position: PropTypes.oneOf(['bottom', 'bottom-right', 'top-right']).isRequired,
};

Step.propTypes = {
  number: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

IOSContent.propTypes = {
  iosBrowser: PropTypes.string.isRequired,
  isIPad: PropTypes.bool.isRequired,
  needsSafari: PropTypes.bool.isRequired,
  onCopy: PropTypes.func.isRequired,
};

InAppContent.propTypes = {
  onCopy: PropTypes.func.isRequired,
};

export default function PwaInstallModal() {
  const { showPrompt, mode, iosBrowser, isIPad, needsSafari, loading, install, dismiss, copyLink } = usePwaInstallPrompt();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!showPrompt) return null;

  const handleCancel = () => {
    dismiss(dontShowAgain);
  };

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') message.success('App installed! Open it from your home screen.');
  };

  const handleCopy = async () => {
    const copied = await copyLink();
    if (copied) message.success('Link copied. Paste it in your browser.');
    else message.error('Could not copy the link.');
  };

  return (
    <Modal
      open={showPrompt}
      onCancel={handleCancel}
      centered
      width={420}
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <img src="/icons/launchericon-96x96.png" alt="" className="w-8 h-8 rounded-lg" />
          <span>Install School of Athens</span>
        </div>
      }
      footer={[
        <div key="footer" className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <Checkbox
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="text-xs text-gray-500 self-start sm:self-center"
          >
            Don&apos;t ask me again
          </Checkbox>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button onClick={handleCancel} disabled={loading}>
              Maybe Later
            </Button>
            {mode === 'native' && (
              <Button type="primary" onClick={handleInstall} loading={loading} className="bg-primary hover:bg-primary-dark">
                Install App
              </Button>
            )}
          </div>
        </div>,
      ]}
    >
      <div className="py-2 text-[13px] text-gray-600 space-y-3 leading-relaxed">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <BellOutlined className="text-amber-600" />
            <span>Get class and reschedule alerts on your phone</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ThunderboltOutlined className="text-primary" />
            <span>Opens instantly from your home screen</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MobileOutlined className="text-indigo-500" />
            <span>Full-screen, just like an app</span>
          </div>
        </div>

        {mode === 'ios' && <IOSContent iosBrowser={iosBrowser} isIPad={isIPad} needsSafari={needsSafari} onCopy={handleCopy} />}
        {mode === 'android-manual' && <AndroidManualContent />}
        {mode === 'in-app' && <InAppContent onCopy={handleCopy} />}
      </div>
    </Modal>
  );
}
