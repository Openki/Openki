import { base64PngImageData } from '/imports/utils/base64-png-image-data';
import { PublicSettings } from '/imports/utils/PublicSettings';

export function toEmailLogo(emailLogo: string) {
	if (emailLogo.startsWith('data:image/')) {
		// base64 image
		return emailLogo;
	}

	if (emailLogo.startsWith(PublicSettings.s3.publicUrlBase)) {
		// in our s3 file storage
		return emailLogo;
	}

	return base64PngImageData(emailLogo);
}
