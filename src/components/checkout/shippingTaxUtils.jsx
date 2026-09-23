// Tax rates by state (US only)
const US_TAX_RATES = {
  'AL': 0.04, 'AK': 0, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
  'CO': 0.029, 'CT': 0.0635, 'DE': 0, 'FL': 0.06, 'GA': 0.04,
  'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
  'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
  'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
  'MT': 0, 'NE': 0.055, 'NV': 0.0685, 'NH': 0, 'NJ': 0.06625,
  'NM': 0.05125, 'NY': 0.04, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
  'OK': 0.045, 'OR': 0, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
  'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
  'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
  'DC': 0.06
};

export function calculateTax(subtotal, state, country) {
  if (country === 'US' && state) {
    const rate = US_TAX_RATES[state.toUpperCase()] || 0;
    return subtotal * rate;
  }
  // International orders - no tax calculated (handled by customs)
  return 0;
}

export function getShippingOptions(country, subtotal) {
  const isDomestic = country === 'US' || country === 'CA';
  
  if (isDomestic) {
    return [
      {
        id: 'standard',
        name: 'Standard',
        time: '5-7 business days',
        price: subtotal >= 150 ? 0 : 15,
        description: 'Free shipping on orders over $150'
      },
      {
        id: 'express',
        name: 'Express',
        time: '2-3 business days',
        price: 25,
        description: 'Faster delivery'
      },
      {
        id: 'overnight',
        name: 'Overnight',
        time: '1 business day',
        price: 45,
        description: 'Next day delivery'
      }
    ];
  } else {
    // International shipping
    return [
      {
        id: 'international',
        name: 'International Standard',
        time: '10-14 business days',
        price: 35,
        description: 'Customs fees may apply'
      },
      {
        id: 'international_express',
        name: 'International Express',
        time: '5-7 business days',
        price: 65,
        description: 'Express international shipping'
      }
    ];
  }
}

export function calculateShipping(method, country, subtotal) {
  const options = getShippingOptions(country, subtotal);
  const selected = options.find(opt => opt.id === method);
  return selected ? selected.price : 0;
}