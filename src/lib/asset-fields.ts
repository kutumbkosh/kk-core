import type { AssetType } from "@/types/database";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

// Common institution suggestions per asset type
export const INSTITUTION_SUGGESTIONS: Partial<Record<AssetType, string[]>> = {
  BANK_ACCOUNT: [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank", "IndusInd Bank",
    "Yes Bank", "IDBI Bank", "Federal Bank", "Bank of India", "Indian Bank",
    "IDFC First Bank", "Bandhan Bank", "RBL Bank",
    "AU Small Finance Bank", "Jana Small Finance Bank", "Ujjivan Small Finance Bank",
    "Equitas Small Finance Bank", "ESAF Small Finance Bank", "Suryoday Small Finance Bank",
    "South Indian Bank", "Karur Vysya Bank", "Dhanlaxmi Bank", "Jammu & Kashmir Bank",
    "Nainital Bank", "City Union Bank",
  ],
  FIXED_DEPOSIT: [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Punjab National Bank", "Bank of Baroda", "Post Office", "Bajaj Finance", "Shriram Finance",
    "IDFC First Bank", "AU Small Finance Bank", "Jana Small Finance Bank",
    "Ujjivan Small Finance Bank", "Mahindra Finance", "Muthoot Finance",
  ],
  MUTUAL_FUND: [
    "SBI Mutual Fund", "HDFC AMC", "ICICI Prudential", "Axis AMC", "Kotak AMC",
    "Nippon India", "Aditya Birla Sun Life", "UTI AMC", "DSP Mutual Fund",
    "Mirae Asset", "Motilal Oswal", "Parag Parikh", "Groww", "Zerodha Coin", "Kuvera",
  ],
  INSURANCE: [
    "LIC", "HDFC Life", "ICICI Prudential Life", "SBI Life", "Max Life",
    "Bajaj Allianz", "Tata AIA", "Star Health", "New India Assurance",
    "HDFC Ergo", "ICICI Lombard", "Digit Insurance", "Acko",
  ],
  DEMAT: [
    "Zerodha", "Groww", "Angel One", "Upstox", "ICICI Direct",
    "HDFC Securities", "Kotak Securities", "Motilal Oswal", "5Paisa", "Paytm Money",
  ],
  LOAN: [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Bajaj Finserv", "Tata Capital", "HDFC Ltd", "LIC Housing Finance", "PNB Housing",
  ],
  CREDIT_CARD: [
    "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Kotak Mahindra Bank",
    "American Express", "RBL Bank", "IndusInd Bank", "Yes Bank", "HSBC",
  ],
};

// Fields specific to each asset type (beyond the common ones)
export const ASSET_TYPE_FIELDS: Record<AssetType, FieldConfig[]> = {
  BANK_ACCOUNT: [
    { name: "account_type", label: "Account Type", type: "select", required: true, options: [
      { value: "savings", label: "Savings" },
      { value: "current", label: "Current" },
      { value: "salary", label: "Salary" },
      { value: "nre", label: "NRE" },
      { value: "nro", label: "NRO" },
    ]},
    { name: "branch", label: "Branch", type: "text", placeholder: "e.g. Koramangala, Bangalore" },
    { name: "ifsc", label: "IFSC Code", type: "text", placeholder: "e.g. HDFC0001234" },
    { name: "has_net_banking", label: "Net Banking Enabled?", type: "select", options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Not sure" },
    ]},
  ],
  FIXED_DEPOSIT: [
    { name: "fd_type", label: "Type", type: "select", options: [
      { value: "fd", label: "Fixed Deposit" },
      { value: "rd", label: "Recurring Deposit" },
      { value: "tax_saver", label: "Tax Saver FD" },
    ]},
    { name: "maturity_date", label: "Maturity Date", type: "date" },
    { name: "interest_rate", label: "Interest Rate (%)", type: "number", placeholder: "e.g. 7.5" },
    { name: "auto_renew", label: "Auto Renewal?", type: "select", options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Not sure" },
    ]},
  ],
  MUTUAL_FUND: [
    { name: "fund_name", label: "Fund / Scheme Name", type: "text", placeholder: "e.g. HDFC Flexi Cap Fund" },
    { name: "folio_number", label: "Folio Number", type: "text", placeholder: "Optional" },
    { name: "investment_type", label: "Investment Type", type: "select", options: [
      { value: "sip", label: "SIP" },
      { value: "lumpsum", label: "Lump Sum" },
      { value: "both", label: "Both" },
    ]},
    { name: "sip_amount", label: "SIP Amount (if applicable)", type: "number", placeholder: "e.g. 5000" },
  ],
  INSURANCE: [
    { name: "policy_type", label: "Policy Type", type: "select", required: true, options: [
      { value: "term", label: "Term Life" },
      { value: "endowment", label: "Endowment" },
      { value: "ulip", label: "ULIP" },
      { value: "health", label: "Health" },
      { value: "motor", label: "Motor" },
      { value: "home", label: "Home" },
      { value: "travel", label: "Travel" },
      { value: "other", label: "Other" },
    ]},
    { name: "policy_number", label: "Policy Number (last 4 digits)", type: "text", placeholder: "e.g. 1234" },
    { name: "sum_assured", label: "Sum Assured / Cover Amount", type: "text", placeholder: "e.g. 1 Crore" },
    { name: "premium_amount", label: "Premium Amount (₹)", type: "number", placeholder: "e.g. 15000" },
    { name: "premium_frequency", label: "Premium Frequency", type: "select", options: [
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "half_yearly", label: "Half Yearly" },
      { value: "yearly", label: "Yearly" },
      { value: "one_time", label: "One Time" },
    ]},
    { name: "expiry_date", label: "Policy Expiry Date", type: "date" },
  ],
  DEMAT: [
    { name: "dp_id", label: "DP ID / Client ID (last 4)", type: "text", placeholder: "e.g. 4567" },
    { name: "stocks_held", label: "Key Stocks Held", type: "textarea", placeholder: "e.g. Reliance, TCS, Infosys" },
    { name: "has_pledge", label: "Any Pledged Shares?", type: "select", options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unknown", label: "Not sure" },
    ]},
  ],
  EPF: [
    { name: "uan", label: "UAN Number", type: "text", placeholder: "e.g. 100XXXXXXXXX" },
    { name: "employer", label: "Current / Last Employer", type: "text", placeholder: "e.g. TCS" },
    { name: "member_id", label: "Member ID", type: "text", placeholder: "Optional" },
  ],
  PPF_NPS: [
    { name: "account_subtype", label: "Account Type", type: "select", required: true, options: [
      { value: "ppf", label: "PPF" },
      { value: "nps", label: "NPS" },
    ]},
    { name: "pran", label: "PRAN / PPF Account Number (last 4)", type: "text", placeholder: "e.g. 5678" },
    { name: "maturity_date", label: "Maturity Date (PPF)", type: "date" },
  ],
  LOAN: [
    { name: "loan_type", label: "Loan Type", type: "select", required: true, options: [
      { value: "home", label: "Home Loan" },
      { value: "personal", label: "Personal Loan" },
      { value: "car", label: "Car Loan" },
      { value: "education", label: "Education Loan" },
      { value: "gold", label: "Gold Loan" },
      { value: "business", label: "Business Loan" },
      { value: "other", label: "Other" },
    ]},
    { name: "loan_account", label: "Loan Account (last 4)", type: "text", placeholder: "e.g. 9012" },
    { name: "emi_amount", label: "EMI Amount (₹)", type: "number", placeholder: "e.g. 25000" },
    { name: "outstanding_amount", label: "Approx Outstanding", type: "text", placeholder: "e.g. 15 Lakhs" },
    { name: "end_date", label: "Loan End Date", type: "date" },
  ],
  CREDIT_CARD: [
    { name: "card_network", label: "Card Network", type: "select", options: [
      { value: "visa", label: "Visa" },
      { value: "mastercard", label: "Mastercard" },
      { value: "rupay", label: "RuPay" },
      { value: "amex", label: "Amex" },
      { value: "diners", label: "Diners" },
    ]},
    { name: "card_name", label: "Card Name", type: "text", placeholder: "e.g. Regalia, Infinia" },
    { name: "credit_limit", label: "Credit Limit", type: "text", placeholder: "e.g. 3 Lakhs" },
    { name: "annual_fee", label: "Annual Fee (₹)", type: "number", placeholder: "e.g. 2500" },
  ],
  LOCKER: [
    { name: "locker_number", label: "Locker Number", type: "text", placeholder: "Optional" },
    { name: "locker_size", label: "Locker Size", type: "select", options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ]},
    { name: "branch", label: "Branch / Location", type: "text", placeholder: "e.g. MG Road, Bangalore" },
    { name: "contents_hint", label: "Contents Hint", type: "textarea", placeholder: "Brief description of what's inside (e.g. jewellery, documents)", helpText: "Only you can see this. Helps your family know what to expect." },
  ],
  REAL_ESTATE: [
    { name: "property_type", label: "Property Type", type: "select", required: true, options: [
      { value: "apartment", label: "Apartment / Flat" },
      { value: "house", label: "Independent House" },
      { value: "plot", label: "Plot / Land" },
      { value: "commercial", label: "Commercial" },
      { value: "other", label: "Other" },
    ]},
    { name: "address", label: "Property Address", type: "textarea", placeholder: "Full address of the property" },
    { name: "ownership", label: "Ownership", type: "select", options: [
      { value: "sole", label: "Sole Owner" },
      { value: "joint", label: "Joint Owner" },
      { value: "inherited", label: "Inherited" },
    ]},
    { name: "registration_number", label: "Registration Number (last 4)", type: "text", placeholder: "Optional" },
    { name: "has_loan", label: "Has Home Loan?", type: "select", options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ]},
  ],
};

// Value band options
export const VALUE_BAND_OPTIONS = [
  { value: "<1L", label: "Under ₹1 Lakh" },
  { value: "1-5L", label: "₹1 - 5 Lakhs" },
  { value: "5-10L", label: "₹5 - 10 Lakhs" },
  { value: "10-50L", label: "₹10 - 50 Lakhs" },
  { value: "50L+", label: "₹50 Lakhs+" },
];
