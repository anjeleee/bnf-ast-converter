import React, { useState, useEffect, useCallback } from 'react';
import TreeView from "./TreeView.jsx";
import { countNodes, getDepth, countLeaves } from "./compiler/treeUtils.js";