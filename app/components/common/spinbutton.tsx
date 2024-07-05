import Image from "next/image"
export default function SpinButton({ number = 0, setNumber }) {
    const onChange = (e) => {
        setNumber(e.target.value);
    }
    return (
        <div>
            <div className="spin-number">
                <input
                    className="token-input"
                    value={number}
                    placeholder=""
                    onChange={onChange}
                />
            </div>
            <div className="flex-col">
                <div className="spin-up" onClick={() => { setNumber(Number(number) + 1) }}>
                    <Image
                        src="/images/up.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            height: 'auto',
                        }}
                        width={13}
                        height={8}
                    />
                </div>
                <div className="spin-down" onClick={() => { setNumber(number - 1 < 0 ? 0 : number - 1) }}>
                    <Image
                        src="/images/down.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            height: 'auto',
                        }}
                        width={13}
                        height={8}
                    />
                </div>
            </div>
        </div>
    )
}