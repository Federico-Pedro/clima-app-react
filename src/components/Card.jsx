function Card({ size = "small", children }) {
    return (
        <div className={`card card-${size}`}>
            {children}
        </div>
    )
}

export default Card