export default function makeId(length: number) {
  let id = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; ++i) {
    id += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return id;
}
