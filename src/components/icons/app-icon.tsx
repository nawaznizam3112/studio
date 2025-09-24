
export function AppIcon() {
    return (
        <svg
            width="512"
            height="512"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="512" height="512" rx="128" fill="url(#gradient)" />
            <g transform="translate(102.4, 102.4) scale(0.6)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M170.667 0H106.667C47.7563 0 0 47.7563 0 106.667V170.667H170.667V0ZM0 405.333V448C0 483.346 28.6538 512 64 512H106.667V405.333H0Z"
                    fill="white"
                    fillOpacity="0.8"
                />
                <path
                    d="M0 256H170.667V362.667H0V256Z"
                    fill="white"
                    fillOpacity="0.8"
                />
                <path
                    d="M256 0H362.667V170.667H256V0Z"
                    fill="white"
                    fillOpacity="0.8"
                />
                <path
                    d="M448 0H405.333V170.667H512V64C512 28.6538 483.346 0 448 0Z"
                    fill="white"
                    fillOpacity="0.8"
                />
                <rect
                    x="256"
                    y="256"
                    width="256"
                    height="256"
                    rx="48"
                    fill="white"
                />
                <text
                    x="384"
                    y="400"
                    fontFamily="Inter, sans-serif"
                    fontSize="220"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="hsl(var(--primary))"
                >
                    E
                </text>
            </g>
            <defs>
                <linearGradient
                    id="gradient"
                    x1="0"
                    y1="0"
                    x2="512"
                    y2="512"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="hsl(var(--accent))" />
                </linearGradient>
            </defs>
        </svg>
    );
}
