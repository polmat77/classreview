interface Particle {
  id: number;
  size: number;
  color: "gold" | "cyan";
  left: string;
  top: string;
  delay: number;
  duration: number;
}

const FloatingParticles = () => {
  const particles: Particle[] = [
    { id: 1, size: 8, color: "gold", left: "10%", top: "20%", delay: 0, duration: 4 },
    { id: 2, size: 12, color: "cyan", left: "85%", top: "15%", delay: 1, duration: 5 },
    { id: 3, size: 6, color: "gold", left: "75%", top: "60%", delay: 0.5, duration: 4.5 },
    { id: 4, size: 10, color: "cyan", left: "20%", top: "70%", delay: 1.5, duration: 3.5 },
    { id: 5, size: 8, color: "gold", left: "60%", top: "25%", delay: 2, duration: 4 },
    { id: 6, size: 14, color: "cyan", left: "40%", top: "80%", delay: 0.8, duration: 5 },
    { id: 7, size: 6, color: "gold", left: "90%", top: "45%", delay: 1.2, duration: 4.2 },
    { id: 8, size: 10, color: "cyan", left: "5%", top: "55%", delay: 0.3, duration: 3.8 },
    { id: 9, size: 8, color: "gold", left: "50%", top: "10%", delay: 2.5, duration: 4.8 },
    { id: 10, size: 12, color: "cyan", left: "30%", top: "40%", delay: 1.8, duration: 5.2 },
  ];

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full pointer-events-none animate-pulse ${
            particle.color === "gold" 
              ? "bg-[#f0a830]/30" 
              : "bg-[#7dd3e8]/30"
          }`}
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </>
  );
};

export default FloatingParticles;
