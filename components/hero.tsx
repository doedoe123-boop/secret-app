"use client";

export default function Header() {
  return (
    <div className="flex flex-col gap-10 items-center text-center">
      {/* Glitch Effect Title */}
      <h1 className="text-4xl font-bold tracking-widest text-red-600 dark:text-red-400 glitch">
        🔒 SECRET APP
      </h1>

      {/* Subtitle */}
      <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-lg">
        Access is restricted. Only authorized users may proceed.
      </p>

      {/* Glitch Effect Divider */}
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-gray-500/30 to-transparent dark:via-gray-400/20 my-6" />

      {/* Styles for the glitch effect */}
      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); opacity: 1; }
          20% { transform: translate(-2px, 2px); opacity: 0.8; }
          40% { transform: translate(2px, -2px); opacity: 1; }
          60% { transform: translate(-2px, 2px); opacity: 0.9; }
          80% { transform: translate(2px, -2px); opacity: 1; }
          100% { transform: translate(0); opacity: 1; }
        }

        .glitch {
          position: relative;
          animation: glitch 0.8s infinite alternate;
        }

        .glitch::before,
        .glitch::after {
          content: "SECRET APP";
          position: absolute;
          left: 0;
          width: 100%;
          color: red;
          background: black;
          overflow: hidden;
          clip: rect(0, 900px, 0, 0);
        }

        .glitch::before {
          animation: glitch 0.75s infinite alternate-reverse;
          left: 2px;
          text-shadow: -2px 0 red;
        }

        .glitch::after {
          animation: glitch 0.75s infinite alternate;
          left: -2px;
          text-shadow: 2px 0 cyan;
        }
      `}</style>
    </div>
  );
}
