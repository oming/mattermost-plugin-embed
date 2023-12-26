import React from 'react';

interface Props {
    siteTitle: string;
}
export default function HeaderRight({siteTitle}: Props) {
    return <div>{siteTitle}</div>;
}
