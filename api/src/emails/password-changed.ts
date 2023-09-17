const EMAIL = ``

export default function PasswordChangedEmail({ name }: EmailArgs) {
	return EMAIL.replace('%NAME%', name)
}

type EmailArgs = {
	name: string
}
