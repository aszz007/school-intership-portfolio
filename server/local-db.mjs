import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function localDB(filename = ':memory:') {
  const db = new DatabaseSync(filename);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const prepare = sql => {
    const statement = db.prepare(sql);
    const bind = (...args) => ({
      first:async () => statement.get(...args) || null,
      run:async () => ({meta:{changes:statement.run(...args).changes}})
    });
    return {bind, ...bind()};
  };
  return {prepare, close:() => db.close()};
}
