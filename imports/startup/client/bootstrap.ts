// Import just what we need from bootstrap v5

import "bootstrap/js/dist/alert";
import "bootstrap/js/dist/button";
// import 'bootstrap/js/dist/carousel';
// import 'bootstrap/js/dist/popover';
// import 'bootstrap/js/dist/scrollspy';
import "bootstrap/js/dist/tab";
// import 'bootstrap/js/dist/toast';

// Prevents double import and execution.
// import "bootstrap/js/dist/collapse";
// import "bootstrap/js/dist/dropdown";
// import "bootstrap/js/dist/modal";
// import "bootstrap/js/dist/tooltip";
export { Collapse, Dropdown, Modal, Tooltip } from "bootstrap";

// Use the ScrollBarHelper class to hide the scrollbar when a panel is opened. 
// This prevents the page from jumping when the scrollbar disappears.
// It is internal used by bootstrap for the Modal component.
export { default as ScrollBarHelper } from "bootstrap/js/dist/util/scrollbar";
