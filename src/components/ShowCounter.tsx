type DateTimeDisplayProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function ShowCounter({
  days,
  hours,
  minutes,
  seconds,
}: DateTimeDisplayProps) {
  return (
    <div className="flex">
      <div className="">
        <p>{`${hours}`.length == 1 ? `0${hours}` : hours}</p>
      </div>
      <p>:</p>
      <div className="">
        <p>{`${minutes}`.length == 1 ? `0${minutes}` : minutes}</p>
      </div>
      <p>:</p>
      <div className="">
        <p>{`${seconds}`.length == 1 ? `0${seconds}` : seconds}</p>
      </div>
    </div>
  );
}
