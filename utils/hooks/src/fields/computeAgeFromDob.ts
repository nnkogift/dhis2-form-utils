/** Compute whole years of age from a YYYY-MM-DD date of birth string. */
export function computeAgeFromDob(dob: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return '';
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? String(age) : '';
}
