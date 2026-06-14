function CreditCardFields({ formData, updateField }) {
  const handleCardNumberChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "") // numbers only
      .slice(0, 16); // max 16 digits

    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    updateField("cardNumber", formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    updateField("expiry", value);
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    updateField("cvv", value);
  };

  const handleNameChange = (e) => {
    const value = e.target.value
      .replace(/[^a-zA-Z\s]/g, "")
      .slice(0, 50);

    updateField("cardHolder", value);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <label className="mb-1 block text-sm font-medium text-text-light">
          Card Holder's Full Name
        </label>
        <input
          type="text"
          value={formData.cardHolder}
          onChange={handleNameChange}
          maxLength={50}
          autoComplete="cc-name"
          className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-light">
          Card Number
        </label>
        <input
          type="text"
          value={formData.cardNumber}
          onChange={handleCardNumberChange}
          inputMode="numeric"
          autoComplete="cc-number"
          maxLength={19} // 16 digits + 3 spaces
          className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
          placeholder="1234 5678 9010 9021"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            Expiry Date
          </label>
          <input
            type="text"
            value={formData.expiry}
            onChange={handleExpiryChange}
            inputMode="numeric"
            autoComplete="cc-exp"
            maxLength={5}
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
            placeholder="MM/YY"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">
            CVV
          </label>
          <input
            type="password"
            value={formData.cvv}
            onChange={handleCVVChange}
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            className="w-full rounded-md border border-border bg-surface-alt px-4 py-3 text-text outline-none my-transition focus:border-primary placeholder:text-text-muted/50"
            placeholder="123"
          />
        </div>
      </div>
    </div>
  );
}

export default CreditCardFields;