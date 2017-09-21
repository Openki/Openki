import Shariff from 'shariff';
import 'shariff/build/shariff.min.css';

Template.sharing.onRendered(function() {
	this.shariff = new Shariff(this.find('.shariff'));
});
