import Image from "next/image";
import S_Button from "../common/button";
import MarqueeSlider from "react-marquee-slider";
const m_data = [
    {
        title: "Ending Soon",
        image: "/images/b1.svg"
    },
    {
        title: "Try your luck",
        image: "/images/b2.svg"
    },
    {
        title: "Todays Best Deal",
        image: "/images/b3.svg"
    },
    {
        title: "Todays Best Deal",
        image: "/images/b4.svg"
    },
    {
        title: "Ending Soon",
        image: "/images/b1.svg"
    },
    {
        title: "Try your luck",
        image: "/images/b2.svg"
    },
    {
        title: "Todays Best Deal",
        image: "/images/b3.svg"
    },
    {
        title: "Todays Best Deal",
        image: "/images/b4.svg"
    }
]

export default function Branding() {
    return (
        <div className="branding">
            <MarqueeSlider velocity={25}>
                {
                    m_data.map((e, i) => {
                        return (
                            <div className="brand" key={`marquee-example-${i}`}>
                                <div className="brand-image">
                                    <Image
                                        src={e.image}
                                        alt="Vercel Logo"
                                        className="light"
                                        sizes="100vw"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                        }}
                                        width={218}
                                        height={54}
                                    />
                                </div>
                                <div className="brand-title">
                                    {e.title}
                                </div>
                                <S_Button b_name="View" color="#DBEF60" width="90px" height="31px" />
                            </div>
                        )
                    })
                }
            </MarqueeSlider>
        </div >
    )
}