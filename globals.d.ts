//import cytoscape from 'cytoscape';
import * as log from 'loglevel';
//import Fuse from 'fuse.js';
import MicroModal from 'micromodal';
import {Notyf} from 'notyf';
import GoldenLayout from 'golden-layout';

declare global
{
  const log: log.DefaultLogger;
  const Fuse: Fuse.Fuse;
  function cytoscape() : cytoscape.Core;
  const Notyf: Notyf;
  const hotkeys: Function;
  const tippy: Function;
  const MicroModal: MicroModal;
  const GoldenLayout: GoldenLayout;
}
