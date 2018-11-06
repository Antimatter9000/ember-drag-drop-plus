import Service from '@ember/service';
import $ from 'jquery';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';

import base from './_base';
import copyToIndex from './_copy-to-index';
import drop from './_drop';
import grab from './_grab';
import navigate from './_navigate';
import setDropTarget from './_set-drop-target';
import shift from './_shift';
import sort from './_sort';
import transfer from './_transfer';

export default Service.extend(Object.assign({},
    base,
    copyToIndex,
    drop,
    grab,
    navigate,
    setDropTarget,
    shift,
    sort,
    transfer
));
