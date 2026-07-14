function CryptoFields({ formData, updateField }) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <label className="mb-1 block text-sm font-medium text-text-light">
          Network
        </label>
        <select
          required
          value={formData.network}
          onChange={(e) => updateField("network", e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary [&>option]:bg-surface"
        >
          <option value="">Select Network</option>
          <option>Bitcoin</option>
          <option>Ethereum (ERC20)</option>
          <option>BNB Smart Chain</option>
          <option>Polygon</option>
          <option>Solana</option>
          <option>TRON (TRC20)</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-light">
          Wallet Address
        </label>
        <textarea
          required
          rows={4}
          value={formData.walletAddress}
          onChange={(e) => updateField("walletAddress", e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
          placeholder="Paste wallet address..."
        />
      </div>
    </div>
  );
}

export default CryptoFields;