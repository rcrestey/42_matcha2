import React from 'react';

export default function LayoutSignOn({ title, children }) {
    return (
        <section className="flex justify-center items-start w-full h-auto">
            <article className="flex justify-center flex-wrap w-64 mt-10">
                <h2 className="w-full text-center py-2 mx-6 my-3 text-gray-900 font-bold text-3xl font-title uppercase">
                    {title}
                </h2>

                {children}
            </article>
        </section>
    );
}
