import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from './card';


export function News() {

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Up Coming Changes!
                </CardTitle>
                <CardHeader>
                </CardHeader>
                <li>
                    Better functional checks
                </li>
                <li>
                    Bug fixes
                </li>
                <li>
                    More graphs
                </li>
                <li>
                    Set up support page
                </li>
                <li>
                    Set up partner page
                </li>
            </CardHeader>
        </Card>
    );
}