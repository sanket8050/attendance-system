import React from 'react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
function page() {
    return (
        <div>
            <Link href="/roles/sanket" className="text-blue-500 hover:underline">
            <Button />
            </Link>

        </div>
    );
}

export default page;