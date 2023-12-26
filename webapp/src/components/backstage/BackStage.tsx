/* eslint-disable prefer-const */
import React, {useEffect} from 'react';

interface Props {
    url: string;
}
export default function BackStage({url}: Props) {
    useEffect(() => {
        document.body.classList.add('app__body');
        return () => {
            document.body.classList.remove('app__body');
        };
    }, []);

    return (
        <div
            style={{
                display: 'inline',
            }}
        >
            <iframe
                src={url}
                width='100%'
                height='100%'
                allowFullScreen={true}
            />
        </div>
    );
}
