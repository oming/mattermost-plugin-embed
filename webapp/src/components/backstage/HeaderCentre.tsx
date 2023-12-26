import React from 'react';

interface Props {
    siteUrl: string;
}
export default function HeaderCentre({siteUrl}: Props) {
    return <div>{siteUrl}</div>;
}
