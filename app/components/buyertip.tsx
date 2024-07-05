import Image from "next/image";

export default function BuyerTip() {
    return (
        <div className="about-creating">
            <div className="module-container">
                <div className="module-main">
                    <p className="about-raffle-title">SOLucky Raffle Buyer&apos;s Tips</p>
                    <p className="about-raffle-content">Welcome to the SOLucky Raffle Buyer&apos;s Tips!</p>
                    <p className="about-raffle-content">In this page, we would like to share the latest features in Raffle. These features are implemented in an attempt to help buyers manage their risk.</p>

                    {/* section 1 */}
                    <p className="about-raffle-section">1. FFF Raffle safety measures</p>
                    <Image
                        src="/images/buyer-tip.png"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        width={1187}
                        height={469}
                    />

                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}><strong>Raffler credibility : </strong>All the Raffles are set up by the SOLucky Team, so you can be sure that no one is buying his own raffles or rigging the game.</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}><strong>Participant visibility : </strong>Click on <div className="guide-tip-button">Participants</div> tab to see all current buyer addresses with total number of tickets purchased by each wallet.</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>Click on <div className="guide-tip-button">Transactions</div> tab to see complete transaction history including date and number of tickets purchased each time. Clicking any txn or buyer address shows detailed information.</p>

                    {/* section 2 */}
                    <p className="about-raffle-section">2. Buyer Tips</p>

                    <p className="about-raffle-content-bold">Understand Probability</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>Realize that a 99.9% chance of winning is not the same as 100%, just as a 0.01% chance is not 0%. Entering the raffle multiple times does not guarantee a win. This is the nature of probability. For instance, flipping heads on a coin ten times in a row is highly improbable but not impossible. The only way to ensure a 100% chance of winning is to purchase all the tickets available, leaving no chance for other participants.</p>

                    <p className="about-raffle-content-bold">Spend Only What You&apos;re Comfortable Losing</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>● Monitor your spending. If participating in raffles stops being fun or you find yourself overcommitting, it’s time to take a break.</p>

                    <p className="about-raffle-content-bold">Never Assume You Will Make the Last Purchase</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>● Remember that others may also be aiming to make last-minute purchases. Consider the maximum possible supply and all the tips provided. Only buy what you are comfortable with.</p>

                    <p className="about-raffle-content-bold">Platform Efforts</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>● While satisfaction cannot be guaranteed due to the raffle&apos;s nature, SOLucky is committed to ensuring a comfortable experience. Stay updated with feedback and happy raffling!</p>

                    <p className="about-raffle-content-bold">Fun and Risk</p>
                    <p className="about-raffle-content" style={{marginLeft: '2rem'}}>● Raffles can be fun and potentially profitable, but they are also risky for both buyers and sellers. Nothing is guaranteed, and probability is never certain. Please read, understand, and accept all the Terms and Conditions stated on the website before participating.</p>
                </div>
            </div>
        </div>
    )
}