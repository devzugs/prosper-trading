function WireTransferFields({ formData, updateField }) {
  const handleBankNameChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9\s&.-]/g, "")
      .slice(0, 100);

    updateField("bankName", value);
  };

  const handleAccountNameChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z\s]/g, "")
      .slice(0, 100);

    updateField("accountName", value);
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 34);

    updateField("accountNumber", value);
  };

  const handleSwiftChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 11);

    updateField("swiftCode", value);
  };

  const handleBankAddressChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9\s,./-]/g, "")
      .slice(0, 200);

    updateField("bankAddress", value);
  };

  return (
    <div className="space-y-3 animate-fade-up">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            Recipient's Bank Name
          </label>
          <input
            required
            type="text"
            value={formData.bankName}
            onChange={handleBankNameChange}
            maxLength={100}
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
            placeholder="Bank of America"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            Account Name
          </label>
          <input
            required
            type="text"
            value={formData.accountName}
            onChange={handleAccountNameChange}
            maxLength={100}
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
            placeholder="John Doe"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            Account Number / IBAN
          </label>
          <input
            required
            type="text"
            value={formData.accountNumber}
            onChange={handleAccountNumberChange}
            maxLength={34}
            autoCapitalize="characters"
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            SWIFT / BIC Code
          </label>
          <input
            required
            type="text"
            value={formData.swiftCode}
            onChange={handleSwiftChange}
            maxLength={11}
            autoCapitalize="characters"
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary"
          />
        </div>
      </div>

      {/* Row 3 - Bank Address */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text-light">
          Bank Address
        </label>
        <input
          type="text"
          value={formData.bankAddress}
          onChange={handleBankAddressChange}
          maxLength={200}
          className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
        />
      </div>

    </div>
  );
}

export default WireTransferFields;