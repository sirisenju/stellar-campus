"use client";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { Icon } from "@/components/landing/icons";
import type { DemoWallet } from "@/lib/portal/types";

export function WalletDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (provider: DemoWallet["provider"]) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) {
      previousFocus.current = document.activeElement as HTMLElement;
      el.showModal();
    } else if (!open && el?.open) el.close();
  }, [open]);
  function focusTrap(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const nodes =
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <dialog
      ref={dialog}
      className="p-wallet-dialog"
      aria-labelledby="wallet-dialog-title"
      onKeyDown={focusTrap}
      onCancel={onClose}
      onClose={() => {
        previousFocus.current?.focus();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="p-wallet-dialog-inner">
        <button
          className="p-dialog-close"
          aria-label="Close wallet chooser"
          autoFocus
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <span className="p-square-icon">
          <Icon name="wallet" />
        </span>
        <p className="p-eyebrow">Your first connection</p>
        <h2 id="wallet-dialog-title">Connect your Stellar wallet</h2>
        <p>Choose a wallet to explore the connection flow.</p>
        <div className="p-wallet-options">
          {(["freighter", "xbull"] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => {
                onSelect(provider);
                onClose();
              }}
            >
              <span className={`p-provider-logo ${provider}`}>
                {provider === "freighter" ? "F" : "x"}
              </span>
              <span>
                <strong>
                  {provider === "freighter" ? "Freighter" : "xBull"}
                </strong>
                <small>Demo connection</small>
              </span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
        <div className="p-note">
          <span className="p-info">i</span>
          <p>
            This interactive preview uses an illustrative wallet. No extension,
            signature, or transaction is requested.
          </p>
        </div>
        <button className="p-text-button p-dialog-cancel" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </dialog>
  );
}
