import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  animals,
} from "unique-names-generator";

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: " ",
  length: 2,
};

export default function makeRandomName(): string {
  return uniqueNamesGenerator(customConfig);
}
