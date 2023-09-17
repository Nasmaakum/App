import React from 'react'

function TableTh(props: TableThProps) {
	const { children, className, hideMobile, ...rest } = props

	return (
		<th
			className={`py-2  ${hideMobile ? 'hidden md:table-cell' : ''} ${
				className || ''
			}`}
			{...rest}
		>
			{children}
		</th>
	)
}

interface TableThProps extends React.HTMLAttributes<HTMLTableCellElement> {
	hideMobile?: boolean
}

function TableTd(props: TableTdProps) {
	const { children, className, hideMobile, ...rest } = props

	return (
		<td
			className={`py-2 ${hideMobile ? 'hidden md:table-cell' : ''} ${
				className || ''
			}`}
			{...rest}
		>
			{typeof children === 'string' ? (
				children
			) : (
				<div className='flex justify-center'>{children}</div>
			)}
		</td>
	)
}

interface TableTdProps extends React.HTMLAttributes<HTMLTableCellElement> {
	hideMobile?: boolean
}

function TableTr(props: TableTrProps) {
	const { children, className, ...rest } = props

	return (
		<tr
			className={`border-t odd:bg-gray-100 hover:bg-gray-200 group-first:border-t-transparent group-first:bg-gray-300 group-first:hover:bg-gray-300 ${
				className || ''
			}`}
			{...rest}
		>
			{children}
		</tr>
	)
}

interface TableTrProps extends React.HTMLAttributes<HTMLTableRowElement> {}

function TableHead(props: TableHeadProps) {
	const { children, className, ...rest } = props

	return (
		<thead className={`group ${className || ''}`} {...rest}>
			{children}
		</thead>
	)
}

interface TableHeadProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {}

function TableBody(props: TableBodyProps) {
	const { children, className, ...rest } = props

	return (
		<tbody className={`${className || ''}`} {...rest}>
			{children}
		</tbody>
	)
}

interface TableBodyProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {}

export default function Table(props: TableProps) {
	const { children, className, ...rest } = props

	return (
		<div className='flex-1 overflow-hidden rounded-md'>
			<table
				className={`w-full table-auto text-center text-sm font-light ${
					className || ''
				}`}
				{...rest}
			>
				{children}
			</table>
		</div>
	)
}

Table.Tr = TableTr
Table.Td = TableTd
Table.Th = TableTh
Table.Head = TableHead
Table.Body = TableBody

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
