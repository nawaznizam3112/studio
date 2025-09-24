
// This page is intentionally left blank to remove the marketplace feature.
// It can be re-introduced later when the feature is fully developed.
import { redirect } from 'next/navigation';

export default function MarketplacePage() {
    redirect('/dashboard');
}
