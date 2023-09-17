export default function validatePassword(password?: string) {
	if (!password) return false

	const passwordRegex =
		/^(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?])(?=.*[A-Z])(?=.*[a-z]).{6,}$/
	const errors = []
	if (!/(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?])/.test(password)) {
		errors.push('Password must contain at least one special character')
	}
	if (!/(?=.*[A-Z])/.test(password)) {
		errors.push('Password must contain at least one uppercase letter')
	}
	if (!/(?=.*[a-z])/.test(password)) {
		errors.push('Password must contain at least one lowercase letter')
	}
	if (!/^.{6,}$/.test(password) || !passwordRegex.test(password)) {
		errors.push(
			'Password must be at least 6 characters and match the required pattern',
		)
	}

	return errors.length === 0
}
