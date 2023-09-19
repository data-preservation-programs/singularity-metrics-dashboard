interface MonthlySealed {
    barData: { [key: string]: string | number }[];
    details: Map<string, [VerifiedClient, number][]>;
    keys: string[];
}

// Export the interface to make it accessible in other files
export default MonthlySealed;
