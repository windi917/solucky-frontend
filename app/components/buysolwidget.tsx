// components/BuySolWidget.js

import { useEffect } from 'react';

const BuySolWidget = () => {
  useEffect(() => {
    // Add MoonPay widget script to the document head
    const script = document.createElement('script');
    script.src = 'https://buy.moonpay.com/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component is unmounted
      document.body.removeChild(script);
    };
  }, []);

  const NEXT_PUBLIC_MOONPAY_API_KEY = 'pk_test_123';
  const moonpayUrl = `https://buy.moonpay.com?apiKey=${NEXT_PUBLIC_MOONPAY_API_KEY}&currencyCode=sol`;

  return (
    <div>
      <h1>Buy SOL with MoonPay</h1>
      <iframe
        src={moonpayUrl}
        title="MoonPay Widget"
        width="100%"
        height="700px"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default BuySolWidget;