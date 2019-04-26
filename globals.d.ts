import cytoscape from 'cytoscape';
import * as log from 'loglevel';
import Fuse from 'fuse';

declare global
{
  const log: log.DefaultLogger;
  const Fuse: Fuse.Fuse;
}
