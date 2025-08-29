import React from 'react';
import Header from './Header';
import './Pricing.css';

const Pricing = () => {
  return (
    <div className="pricing-page">
      <Header />
      <div className="pricing-container">
        <div className="pricing-hero">
          <h1>Pricing Plans</h1>
          <p>Choose the plan that's right for your trading needs (spoiler: there's only one)</p>
        </div>

        <div className="pricing-grid">
          {/* Free Plan - The Only Plan */}
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h2>🎉 The "It's Free" Plan</h2>
              <div className="pricing-price">
                <span className="price-amount">$0</span>
                <span className="price-period">forever</span>
              </div>
              <p className="pricing-subtitle">Because this is a school project, not a real platform</p>
            </div>

            <div className="pricing-features">
              <h3>What You Get (For Free!):</h3>
              <ul>
                <li>✅ Unlimited strategy backtesting</li>
                <li>✅ Access to historical market data</li>
                <li>✅ Performance analytics dashboard</li>
                <li>✅ User profiles and strategy sharing</li>
                <li>✅ Community features (when I build them)</li>
                <li>✅ My eternal gratitude for using my project</li>
                <li>✅ Bragging rights about using a bootcamp project</li>
              </ul>
            </div>

            <div className="pricing-cta">
              <button className="btn btn-primary">Start Trading (It's Free!)</button>
              <p className="pricing-note">No credit card required. No hidden fees. No catch.</p>
            </div>
          </div>

          {/* Joke Plans */}
          <div className="pricing-card joke">
            <div className="pricing-badge">Coming Never</div>
            <div className="pricing-header">
              <h2>🚀 The "Pro" Plan</h2>
              <div className="pricing-price">
                <span className="price-amount">$99</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-subtitle">This doesn't actually exist</p>
            </div>

            <div className="pricing-features">
              <h3>What You Would Get (If This Was Real):</h3>
              <ul>
                <li>❌ Real-time data feeds</li>
                <li>❌ Advanced charting tools</li>
                <li>❌ AI strategy suggestions</li>
                <li>❌ Priority support</li>
                <li>❌ Custom indicators</li>
                <li>❌ Portfolio tracking</li>
                <li>❌ My personal phone number</li>
              </ul>
            </div>

            <div className="pricing-cta">
              <button className="btn btn-disabled" disabled>Not Available</button>
              <p className="pricing-note">This is just here to make the free plan look better</p>
            </div>
          </div>

          <div className="pricing-card joke">
            <div className="pricing-badge">Mythical</div>
            <div className="pricing-header">
              <h2>👑 The "Enterprise" Plan</h2>
              <div className="pricing-price">
                <span className="price-amount">$999</span>
                <span className="price-period">/month</span>
              </div>
              <p className="pricing-subtitle">For companies that don't exist</p>
            </div>

            <div className="pricing-features">
              <h3>What You Would Get (In a Parallel Universe):</h3>
              <ul>
                <li>❌ White-label solution</li>
                <li>❌ API access</li>
                <li>❌ Custom integrations</li>
                <li>❌ Dedicated account manager</li>
                <li>❌ SLA guarantees</li>
                <li>❌ Training sessions</li>
                <li>❌ 1000% ROI</li>
              </ul>
            </div>

            <div className="pricing-cta">
              <button className="btn btn-disabled" disabled>Contact Sales (Joke)</button>
              <p className="pricing-note">I don't even have a sales team. I'm just one person.</p>
            </div>
          </div>
        </div>

        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>🤔 Why is this free?</h3>
            <p>Because I built this for my General Assembly bootcamp final project, not to make money. I'm just happy if people actually use it!</p>
          </div>

          <div className="faq-item">
            <h3>💰 Will you start charging later?</h3>
            <p>Probably not. But I'll accept beer, coffee, or a 50% commission on your profits (losses not included, sorry traders!). And if you're a recruiter, this is totally my portfolio piece!</p>
          </div>

          <div className="faq-item">
            <h3>🔒 Is my data safe?</h3>
            <p>As safe as any project built by a sleep-deprived bootcamp student can be. I'm using industry-standard practices, but maybe don't store your life savings strategy here.</p>
          </div>

          <div className="faq-item">
            <h3>📧 Can I get support?</h3>
            <p>I'll do my best to help, but remember: this was built in a week. My support skills are as polished as my code was on day 1.</p>
          </div>

          <div className="faq-item">
            <h3>🚀 Will you add more features?</h3>
            <p>Maybe! But first I need to recover from the trauma of building this in a week. Give me a few months to process the experience.</p>
          </div>
        </div>

        <div className="pricing-cta-section">
          <h2>Ready to Start Trading for Free?</h2>
          <p>Join the exclusive club of people who use a platform that's completely free because the developer is still in school</p>
          <button className="btn btn-primary">Get Started (It's Still Free!)</button>
          <p className="final-note">Seriously, it's free. I'm not kidding. This is just a school project.</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
