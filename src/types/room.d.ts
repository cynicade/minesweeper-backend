import IMember from "./member";

export default interface IRoom {
  difficulty: string;
  members: Array<IMember>;
}
